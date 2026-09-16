import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import CopilotButton from '../components/chatbot/CopilotButton';

export default function DistrictLayout() {
  return (
    <div className="flex min-h-screen bg-[#f4f7fa] bg-[radial-gradient(at_0%_0%,_#e0e7ff_0px,_transparent_50%),radial-gradient(at_100%_0%,_#bae6fd_0px,_transparent_50%),radial-gradient(at_100%_100%,_#f3e8ff_0px,_transparent_50%),radial-gradient(at_0%_100%,_#e0f2fe_0px,_transparent_50%)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <CopilotButton />
    </div>
  );
}
