import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import RoleDetail from './pages/RoleDetail';
import TaskDetail from './pages/TaskDetail';
import type { AgentSessionEvent } from '@my-team/core';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const { user, setUser, loadRoles, appendTaskLog, updateTaskStatus } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.myTeamAPI.getCurrentUser().then((u) => {
      setUser(u);
      if (u) loadRoles();
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const off1 = window.myTeamAPI.onTaskEvent((taskId: string, event: AgentSessionEvent) => {
      if (event.type === 'log' || event.type === 'needs_input') {
        appendTaskLog(taskId, {
          id: uuidv4(),
          taskId,
          content: event.data,
          timestamp: event.timestamp,
          type: event.type === 'needs_input' ? 'system' : 'stdout',
        });
      }
    });
    const off2 = window.myTeamAPI.onTaskStatusChange((taskId: string, status: string) => {
      updateTaskStatus(taskId, status as import('@my-team/core').TaskStatus);
    });
    return () => {
      off1();
      off2();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<SignIn />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
}
