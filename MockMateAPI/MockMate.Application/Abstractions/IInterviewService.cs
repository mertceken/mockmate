using MockMate.Application.Contracts;

namespace MockMate.Application.Abstractions;

public interface IInterviewService
{
    Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken ct = default);
    Task<SessionDto> GetSessionAsync(Guid sessionId, CancellationToken ct = default);
    Task<AnswerDto> SubmitAnswerAsync(Guid sessionId, Guid questionId, SubmitAnswerRequest request, CancellationToken ct = default);
    Task<SessionDto> CompleteSessionAsync(Guid sessionId, CancellationToken ct = default);
}