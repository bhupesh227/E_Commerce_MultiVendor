"use client";
import React,{useState,useRef, useEffect} from 'react';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import { Download } from 'lucide-react';



type LogType = "success" | "error" | "info" | "warning" | "debug";

type LogItem = {
  type: LogType;
  message: string;
  source?: string;
  timestamp: string;
}

const typeColorMap: Record<LogType, string> = {
  success: "text-green-800",
  error: "text-red-800",
  info: "text-blue-800",
  warning: "text-yellow-800",
  debug: "text-gray-800",
}

const page = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL!);  
    socket.onmessage = (event) => {
      try {
        const logMessage = JSON.parse(event.data);
        setLogs((prevLogs) => [...prevLogs, logMessage]);
      } catch (error) {
        console.error("Error parsing log message:", error);
      }
    }
    return () => socket.close();
  }, []);

  //auto scroll to bottom when new log is added
  useEffect(() => {
    setFilteredLogs(logs);
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // key press event to filter logs
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '1') {
        setFilteredLogs(logs.filter(log => log.type === 'error'));
      }else if (event.key === '2') {
        setFilteredLogs(logs.filter(log => log.type === 'success'));
      } else if (event.key === '0') {
        setFilteredLogs(logs);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [logs]);

  const downloadLogs = () => {
    const content = filteredLogs.map(log => `[${new Date(log.timestamp).toLocaleString()}] ${log.source} [${log.type.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application-logs.log';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold tracking-wide'>Application Logs</h2>
        <button 
          className='text-sm p-3 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-white transition-colors duration-200'
          onClick={downloadLogs}
        >
            <Download size={16} />
            Download Logs
        </button>
      </div>
      <div className='mb-4'>
        <BreadCrumbs title='Application Logs' />
      </div>
      <div 
        ref={logContainerRef}
        className='h-[600px] overflow-y-auto p-4 space-y-1 border-gray-800 bg-black rounded-md'
      >
        {filteredLogs.length === 0 ? (
          <div className='text-center text-gray-500'>No logs available</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className='whitespace-pre-wrap'
            >
              <span className='text-gray-500'>
                [{new Date(log.timestamp).toLocaleString()}]
              </span>{' '}
              <span className='text-purple-400'>{log.source}</span>
              <span className={typeColorMap[log.type]}>[{log.type.toUpperCase()}]</span>{" "}
              <span>{log.message}</span>
            </div>
          )))}
      </div>
    </div>
  )
}

export default page