import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Calendar, MessageSquare, Award, CheckCircle, Database } from 'lucide-react';

const History = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 이력 로드
  const fetchHistory = async () => {
    setLoading(true);
    const data = await apiClient.getHistory();
    setHistoryList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 animate-fade-in-up">
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="border-l-4 border-brand-primary pl-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            추첨 이력 관리
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            지금까지 진행된 이벤트의 당첨 결과 및 이력을 확인합니다.
          </p>
        </div>

        {/* Table Container with Premium styles */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4.5">날짜</th>
                  <th className="px-6 py-4.5">대상 게시물</th>
                  <th className="px-6 py-4.5">총 댓글</th>
                  <th className="px-6 py-4.5">당첨자</th>
                  <th className="px-6 py-4.5">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"></div>
                        이력 데이터 불러오는 중...
                      </div>
                    </td>
                  </tr>
                ) : historyList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      추첨 이력이 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  historyList.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-5.5 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Calendar size={14} className="text-slate-400" />
                          {item.drawDate}
                        </div>
                      </td>
                      
                      {/* Post Title */}
                      <td className="px-6 py-5.5 font-bold text-slate-800">
                        {item.postTitle}
                      </td>
                      
                      {/* Comment Count */}
                      <td className="px-6 py-5.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} className="text-slate-400" />
                          {item.commentCount}개
                        </div>
                      </td>
                      
                      {/* Winners */}
                      <td className="px-6 py-5.5 font-bold text-slate-700 max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5">
                          <Award size={14} className="text-slate-400 shrink-0" />
                          {item.winnerUsername}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-5.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
                          <CheckCircle size={12} className="stroke-[3]" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database notice footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
          <Database size={13} />
          <span>* MYSQL 데이터베이스에 안전하게 저장됩니다.</span>
        </div>

      </div>
    </main>
  );
};

export default History;
