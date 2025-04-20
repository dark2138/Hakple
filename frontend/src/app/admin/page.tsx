'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // 로컬 스토리지에서 액세스 토큰 가져오기
        const token = localStorage.getItem('accessToken');
        console.log('Token found:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to login');
          setDebugInfo({ error: 'No token found' });
          router.push('/login');
          return;
        }
        
        console.log('Checking admin status, API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/check`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 인증 토큰 추가
          },
        });

        console.log('Admin check response status:', response.status);
        if (!response.ok) {
          console.log('Admin check failed, status:', response.status);
          setDebugInfo({ 
            error: 'Admin check failed', 
            status: response.status,
            statusText: response.statusText 
          });
          router.push('/');
          return;
        }

        // 응답 데이터 처리
        const isAdminResult = await response.json();
        console.log('Admin check result:', isAdminResult);
        
        // boolean 값을 확인하여 관리자 권한 설정
        if (isAdminResult === true) {
          console.log('User is admin, showing admin page');
          setIsAdmin(true);
          setDebugInfo({ isAdmin: true, message: 'Admin permissions confirmed' });
        } else {
          console.log('User is not admin, redirecting to home');
          setDebugInfo({ isAdmin: false, message: 'Not an admin user' });
          // 관리자가 아니면 홈으로 이동
          router.push('/');
        }
      } catch (error) {
        console.error('관리자 권한 확인 중 오류 발생:', error);
        setDebugInfo({ error: 'Error checking admin status', details: error });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 디버깅 정보 표시
  if (debugInfo && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">관리자 권한 확인 실패</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <pre className="whitespace-pre-wrap overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔑관리자 페이지</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/reports/comments" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">💬댓글 관리</h2>
          <p className="text-gray-600">신고된 댓글을 관리합니다</p>
        </Link>
        
        <Link href="/admin/reports/posts" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">📃게시글 관리</h2>
          <p className="text-gray-600">신고된 게시글을 관리합니다</p>
        </Link>
      </div>
    </div>
  );
} 