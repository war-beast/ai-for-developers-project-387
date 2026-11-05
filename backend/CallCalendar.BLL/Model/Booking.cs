using System.Text.Json.Serialization;
using CallCalendar.DAL;
using CallCalendar.DAL.Entity;

namespace CallCalendar.BLL.Model;

public sealed record Booking(
    Guid Id,
    string EventTypeId,
    string EventTypeTitle,
    DateTimeOffset Start,
    DateTimeOffset End,
    string GuestName,
    string GuestEmail,
    string Topic,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Comment,
    DateTimeOffset CreatedAt)
{
    /// <summary>Тема разговора по умолчанию; ей же показываются старые записи.</summary>
    public const string DefaultTopic = "Пожаловаться на трудную судьбу";

    /// <summary>Максимальная длина темы вместе с пробельными символами.</summary>
    public const int MaxTopicLength = 250;

    /// <summary>
    /// Создаёт запись, если она не пересекается ни с одной из существующих
    /// (встык — не пересечение): правило применяется здесь, а не в выборке
    /// репозитория. Поля гостя должны быть уже проверены сервисом.
    /// Возвращает null, когда слот занят.
    /// </summary>
    public static Booking? TryCreate(
        EventTypeEntity eventType,
        DateTimeOffset start,
        string guestName,
        string guestEmail,
        string topic,
        string? comment,
        IReadOnlyList<BookingEntity> existing,
        DateTimeOffset now)
    {
        var end = start.AddMinutes(eventType.DurationMinutes);
        if (existing.Any(booking => BookingInterval.Overlaps(start, end, booking.Start, booking.End)))
        {
            return null;
        }

        return new Booking(
            Guid.NewGuid(),
            eventType.Id,
            eventType.Title,
            start,
            end,
            guestName.Trim(),
            guestEmail.Trim(),
            topic.Trim(),
            string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
            now);
    }
}
