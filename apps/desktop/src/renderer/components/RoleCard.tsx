import React from 'react';
import type { Role } from '@my-team/core';

interface RoleCardProps {
  role: Role;
  activeTaskCount: number;
  onClick: () => void;
}

export default function RoleCard({ role, activeTaskCount, onClick }: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-xl p-5 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center text-lg">
          🤖
        </div>
        {activeTaskCount > 0 && (
          <span className="bg-green-900 text-green-300 text-xs font-medium px-2 py-1 rounded-full">
            {activeTaskCount} active
          </span>
        )}
      </div>
      <h3 className="text-white font-semibold text-base mb-1">{role.name}</h3>
      {role.description && (
        <p className="text-gray-400 text-sm line-clamp-2">{role.description}</p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {role.agentRuntimeId ? '⚡ Runtime assigned' : '○ No runtime'}
        </span>
      </div>
    </div>
  );
}
