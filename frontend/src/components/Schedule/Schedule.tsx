import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ScheduleType } from "../../hooks/useFetchSchedule";
import axios from "axios";
import config from '../../../config.json';
import { ScheduleContext } from "../../context/ScheduleContext";
import Button from "../../components/Inputs/Button";
import Spinner from "../../components/Spinner";

function Schedule() {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState<ScheduleType | undefined>(undefined);
  const [show, setShow] = useState<'room' | 'faculty' | 'studentGroup'>('room');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${config.BACKEND_URl}/schedule/${scheduleId}`, {
      headers: { 'Authorization': token }
    })
      .then((response) => { setSchedule(response.data.schedule) })
      .catch((e) => console.log(e))
  }, []);

  useEffect(() => {
    navigate(show);
  }, [show]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await axios.get(`${config.BACKEND_URl}/algorithmInput/schedule/data/${scheduleId}`, {
        headers: {
          "Authorization": token
        }
      });
      setSuccessMessage("Timetable updated successfully!");
    } catch (error) {
      console.error("Error generating timetable:", error);
      setSuccessMessage("Failed to update timetable.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

 

  return (
    <>
      <div className="flex justify-between items-center mb-5 relative">
        <div className='flex bg-background-secondary w-fit rounded-md cursor-pointer text-white'>
          <div
            className={`py-1 px-3 rounded-md rounded-r-none border-2 border-primary-purple/75 ${show === 'room' ? 'bg-primary-purple/75 ' : 'bg-transparent'}`}
            onClick={() => setShow('room')}
          >
            Rooms
          </div>
          <div
            className={`py-1 px-3 border-2 border-primary-purple/75 border-l-0 ${show === 'faculty' ? 'bg-primary-purple/75 ' : 'bg-transparent'}`}
            onClick={() => setShow('faculty')}
          >
            Faculties
          </div>
          <div
            className={`py-1 px-3 rounded-md rounded-l-none border-2 border-primary-purple/75 border-l-0 ${show === 'studentGroup' ? 'bg-primary-purple/75 ' : 'bg-transparent'}`}
            onClick={() => setShow('studentGroup')}
          >
            Students
          </div>
        </div>

        {loading && <Spinner />}
        {successMessage && (
          <div>
            {successMessage}
          </div>
        )}

        <div className="">
          <Button handler={handleGenerate} className="rounded-lg hover:bg-white hover:text-black hover:duration-300">
            Generate
          </Button>
          

        </div>
      </div>


      {schedule ? (
        <ScheduleContext.Provider value={schedule}>
          <Outlet />
        </ScheduleContext.Provider>
      ) : null}
    </>
  );
}

export default Schedule;
