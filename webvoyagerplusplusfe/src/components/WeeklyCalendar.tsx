import React from "react";

export interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  day: string;
  color: string;
}

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  days?: string[];
  startHour?: number;
  endHour?: number;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  events,
  days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startHour = 9,
  endHour = 17,
}) => {
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => `${i + startHour}:00`
  );

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = parseInt(event.startTime.split(":")[0]);
    const startMinute = parseInt(event.startTime.split(":")[1]);
    const endHour = parseInt(event.endTime.split(":")[0]);
    const endMinute = parseInt(event.endTime.split(":")[1]);

    const startPercentage = (startMinute / 60) * 100;
    const durationHours = endHour - startHour + (endMinute - startMinute) / 60;
    const heightPercentage = durationHours * 100;

    return {
      top: `${startPercentage}%`,
      height: `${heightPercentage}%`,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 overflow-x-auto">
      <div className="grid grid-cols-[100px_repeat(5,_1fr)] min-w-[800px]">
        <div /> {/* Empty corner cell */}
        {days.map((day) => (
          <div key={day} className="p-2 border-b border-gray-200 text-center">
            <h2 className="text-lg font-semibold">{day}</h2>
          </div>
        ))}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 border-r border-gray-200">
              <span className="text-sm">{hour}</span>
            </div>
            {days.map((day) => (
              <div
                key={`${day}-${hour}`}
                className="relative h-24 border-b border-r border-gray-200"
              >
                {events
                  .filter((event) => {
                    const eventHour = parseInt(event.startTime.split(":")[0]);
                    return event.day === day && eventHour === parseInt(hour);
                  })
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`absolute w-[90%] rounded p-2 overflow-hidden ${event.color} shadow-sm`}
                      style={getEventPosition(event)}
                    >
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-xs truncate">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
