using Microsoft.AspNetCore.Mvc;
using MockMate.Application.Abstractions;
using MockMate.Application.Contracts;

namespace MockMate.API.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController(IInterviewService service) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create(CreateSessionRequest request, CancellationToken ct)
    {
        var session = await service.CreateSessionAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = session.Id }, session);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SessionDto>> Get(Guid id, CancellationToken ct) =>
        Ok(await service.GetSessionAsync(id, ct));

    [HttpPost("{id:guid}/questions/{questionId:guid}/answer")]
    public async Task<ActionResult<AnswerDto>> SubmitAnswer(
        Guid id, Guid questionId, SubmitAnswerRequest request, CancellationToken ct) =>
        Ok(await service.SubmitAnswerAsync(id, questionId, request, ct));

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<SessionDto>> Complete(Guid id, CancellationToken ct) =>
        Ok(await service.CompleteSessionAsync(id, ct));
}