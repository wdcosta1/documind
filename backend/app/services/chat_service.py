"""LLM integration layer responsible for turning retrieved chunks into grounded answers."""

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.chat import ChatResponse, Citation


class ChatService:
    async def answer(
        self,
        message: str,
        chunks: list[dict[str, str]],
        document_ids: list[str],
    ) -> ChatResponse:
        """Builds a grounded prompt from retrieved chunks and sends it to Ollama."""
        citations = [
            Citation(chunk_id=chunk["chunk_id"], preview=chunk["text"][:180])
            for chunk in chunks
        ]

        if not chunks:
            return ChatResponse(
                answer="I could not find any indexed content for that document yet.",
                citations=[],
                used_llm=False,
            )

        if settings.llm_provider.lower() != "ollama":
            raise HTTPException(
                status_code=500,
                detail=f"Unsupported LLM provider '{settings.llm_provider}'. Set LLM_PROVIDER=ollama.",
            )

        context_blocks = [
            f"[{chunk['chunk_id']}]\n{chunk['text']}"
            for chunk in chunks
        ]
        # Keep the prompt bounded so large documents do not overwhelm the local model context window.
        context = "\n\n".join(context_blocks)[:6000]

        messages = [
            {
                "role": "system",
                "content": (
                    "You answer questions about uploaded documents. "
                    "Use only the provided context. If the answer is not in the context, say so clearly. "
                    "Cite relevant chunk ids inline, for example [chunk-1]."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Documents in scope: {', '.join(document_ids)}\n\n"
                    f"Question: {message}\n\n"
                    f"Context:\n{context}"
                ),
            },
        ]

        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
                response = await client.post(
                    f"{settings.ollama_base_url.rstrip('/')}/api/chat",
                    json={
                        "model": settings.ollama_model,
                        "messages": messages,
                        "stream": False,
                    },
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Failed to reach Ollama. Confirm Ollama is running and that "
                    f"{settings.ollama_model} is available at {settings.ollama_base_url}."
                ),
            ) from exc

        payload = response.json()
        answer = payload.get("message", {}).get("content", "").strip()
        if not answer:
            raise HTTPException(
                status_code=502,
                detail="Ollama returned an empty response.",
            )

        return ChatResponse(answer=answer, citations=citations, used_llm=True)


chat_service = ChatService()
