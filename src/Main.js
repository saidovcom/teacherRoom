import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import store from 'store2'; 
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Main.css';

const localizer = momentLocalizer(moment);

const dayMap = {
  Dushanba: 1,
  Seshanba: 2,
  Chorshanba: 3,
  Payshanba: 4,
  Juma: 5,
  Shanba: 6,
  Yakshanba: 0
};


function getDatesForLastAndNextYearsForDay(dayName, yearsBefore = 5, yearsAfter = 5) {
  const dates = [];
  const targetDay = dayMap[dayName];
  if (targetDay === undefined) return dates;

  const today = new Date();
  const startDate = new Date(today.getFullYear() - yearsBefore, 0, 1);
  const endDate = new Date(today.getFullYear() + yearsAfter, 11, 31);

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const startDay = currentDate.getDay();
  let diff = (targetDay - startDay + 7) % 7;
  currentDate.setDate(currentDate.getDate() + diff);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

function parseTimeRange(date, timeRange) {
  if (!timeRange) {
    return {
      start: moment(date).set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).toDate(),
      end: moment(date).set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toDate(),
    };
  }

  const [startTimeStr, endTimeStr] = timeRange.split('-').map(s => s.trim());

  const start = moment(date).set({
    hour: moment(startTimeStr, ["h:mm A"]).hour(),
    minute: moment(startTimeStr, ["h:mm A"]).minute(),
    second: 0,
    millisecond: 0,
  }).toDate();

  const end = moment(date).set({
    hour: moment(endTimeStr, ["h:mm A"]).hour(),
    minute: moment(endTimeStr, ["h:mm A"]).minute(),
    second: 0,
    millisecond: 0,
  }).toDate();

  return { start, end };
}

export default function Main() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [sentAttendanceDates, setSentAttendanceDates] = useState({});
  const teacher = store.get('teacherName');
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());

  const fetchTeacher = useCallback(async () => {
    try {
      const res = await fetch('https://backendcrm-64wu.onrender.com/api/get/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data) {
        setTeachers(data);
      }
    } catch (err) {
      alert(`Xatolik: ${err.message}`);
    }
  }, [teacher]);

  useEffect(() => {
    try {
      const storedAttendance = store.get('sentAttendance') || {};
      setSentAttendanceDates(storedAttendance);
    } catch (error) {
      console.error("store2 dan yo'qlama ma'lumotlarini yuklashda xato:", error);
      setSentAttendanceDates({});
    }
  }, []);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher, sentAttendanceDates]); 

  const filteredCourse = teacher ? teachers.filter((item) => item.forWhom === teacher) : [];

  const logout = () => {
    store.remove('tokenTeacher');
    navigate('/');
  };

  const events = [];

  filteredCourse.forEach((course) => {
    if (Array.isArray(course.daily)) {
      course.daily.forEach((dayObj) => {
        let rawDay = dayObj?.day?.trim();
        const dayName = rawDay
          ? rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase()
          : '';
        const validDates = getDatesForLastAndNextYearsForDay(dayName, 5, 5);

        validDates.forEach((date) => {
          const { start, end } = parseTimeRange(date, course.time);
          
          events.push({
            title: `${course.group} - ${course.name}`,
            start,
            end,
            group: course.group 
          });
        });
      });
    }
  });

  const eventPropGetter = useCallback((event, start, end, isSelected) => {
    const today = moment().startOf('day'); 
    const eventDate = moment(event.start).startOf('day'); 
    const formattedEventDate = eventDate.format('YYYY-MM-DD'); 
    const eventGroup = event.group;

    const attendanceKey = `${eventGroup}_${formattedEventDate}`;

    let newStyle = {
      backgroundColor: '#3174ad', 
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    if (sentAttendanceDates[attendanceKey]) {
      newStyle.backgroundColor = 'green';
    } else {
      if (eventDate.isBefore(today)) {
        newStyle.backgroundColor = 'red';
      } else if (eventDate.isSame(today)) {
        newStyle.backgroundColor = 'yellow';
        newStyle.color = 'black'; 
      }
    }

    return {
      style: newStyle
    };
  }, [sentAttendanceDates]); 


  let filteredEvents = events;

  if (view === 'day') {
    filteredEvents = events.filter(event => {
      return (
        moment(event.start).isSame(date, 'day')
      );
    });
  } else if (view === 'year') {
    filteredEvents = events.filter(event => moment(event.start).isSame(date, 'year'));
  }

  const views = ['month', 'week', 'day', 'year'];

  return (
    <div className="main-container">
      <div className="header">
       {/* <button onClick={()=>navigate('/calendar')}>jnkl;</button> */}
        <h1 className="teacher-title">
          Teacher: <span>{teacher}</span>
        </h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="calendar-wrapper" style={{ height: '80vh', margin: '20px' }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          views={views}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          onSelectEvent={(event) => {
            navigate('/stgroup', { state: { group: event.group, date: event.start.toDateString() } });
          }}
          eventPropGetter={eventPropGetter}
          style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '10px' }}
        />
      </div>
    </div>
  );
}