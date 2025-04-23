'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalLoginMember } from '@/stores/auth/loginMember'
import { fetchApi } from '@/utils/api'

// 게시물 타입 정의
interface Post {
    id: number
    title: string
    content: string
    createdAt: string
    nickname: string
    likeCount: number
    commentCount: number
    viewCount: number
}

// API 응답 타입 정의
interface PostResponseDto {
    id: number
    title: string
    content: string
    nickname: string
    likeCount: number
    commentCount: number
    viewCount: number
    userId: number
    creationTime: string
    modificationTime: string
    status: string
}

export default function MyPostsPage() {
    const router = useRouter()
    const { isLogin } = useGlobalLoginMember()
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const pageSize = 10

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    // 게시물 데이터 가져오기
    const fetchPosts = async (page = currentPage) => {
        setIsLoading(true)
        setError(null)

        try {
            const url = `/api/v1/posts/my?page=${page}&size=${pageSize}&sort=creationTime,desc`

            // fetchApi 유틸리티 사용
            const response = await fetchApi(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
            })

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/login?redirect=my-posts')
                    return
                }
                throw new Error(`게시물 목록을 불러오는데 실패했습니다. (${response.status})`)
            }

            const data = await response.json()

            // 페이지네이션 정보 추출
            if (data && typeof data === 'object' && 'content' in data) {
                setTotalPages(data.totalPages || 0)
                setTotalElements(data.totalElements || 0)
                setCurrentPage(data.number || 0)
                const content = data.content || []

                const mappedPosts = content.map((item: PostResponseDto) => ({
                    id: item.id,
                    title: item.title || '(제목 없음)',
                    content: item.content || '',
                    createdAt: item.creationTime,
                    nickname: item.nickname || '익명',
                    likeCount: item.likeCount || 0,
                    commentCount: item.commentCount || 0,
                    viewCount: item.viewCount || 0,
                }))

                setPosts(mappedPosts)
            } else {
                setPosts([])
            }
        } catch (err) {
            console.error('게시물 목록 조회 오류:', err)
            setError(err instanceof Error ? err.message : '게시물 목록을 불러오는데 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    // 페이지 변경 핸들러
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
            fetchPosts(newPage)
        }
    }

    // 초기 데이터 로드 및 로그인 상태 확인
    useEffect(() => {
        if (!isLogin) {
            router.push('/login?redirect=my-posts')
            return
        }

        fetchPosts(0) // 초기 로드 시 첫 페이지부터 시작
    }, [router, isLogin])

    // 게시글로 이동
    const handleGoToPost = (postId: number | null) => {
        if (!postId) {
            alert('게시글 정보를 찾을 수 없습니다.')
            return
        }

        try {
            router.push(`/post/${postId}`)
        } catch (error) {
            console.error('게시글 이동 중 오류 발생:', error)
            alert('게시글로 이동할 수 없습니다. 다시 시도해주세요.')
        }
    }

    // 게시물 내용 요약 함수
    const summarizeContent = (content: string, maxLength: number = 100) => {
        if (!content) return ''

        // HTML 태그 제거
        const textContent = content.replace(/<[^>]*>/g, '')

        if (textContent.length <= maxLength) return textContent
        return textContent.substring(0, maxLength) + '...'
    }

    return (
        <div className="px-4 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-800 mb-8">내가 작성한 게시글</h1>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8C4FF2]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-100 p-4 rounded-lg text-red-600 dark:text-red-700">
                        <p>{error}</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-100 rounded-2xl p-10 shadow-md text-center">
                        <p className="text-xl text-gray-600 dark:text-gray-700">작성한 게시글이 없습니다 🥲</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white dark:bg-slate-100 rounded-2xl p-6 shadow-md">
                                    <div
                                        className="cursor-pointer text-lg font-semibold text-gray-800 dark:text-gray-800 mb-3"
                                        onClick={() => handleGoToPost(post.id)}
                                    >
                                        {post.title}
                                    </div>
                                    <div className="flex items-center gap-6 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span>{post.likeCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1C9.11 20.64 10.512 21 12 21z" />
                                            </svg>
                                            <span>{post.commentCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{post.viewCount}</span>
                                        </div>
                                        <button onClick={() => handleGoToPost(post.id)} className="ml-auto text-[#9C50D4] hover:underline flex items-center gap-1">
                                            상세보기
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 컨트롤 */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-2">
                                <button
                                    onClick={() => handlePageChange(0)}
                                    disabled={currentPage === 0}
                                    className={`px-3 py-1 rounded ${currentPage === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#8C4FF2] text-white hover:bg-[#7A43D6]'
                                        }`}
                                >
                                    처음
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className={`px-3 py-1 rounded ${currentPage === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#8C4FF2] text-white hover:bg-[#7A43D6]'
                                        }`}
                                >
                                    이전
                                </button>

                                <span className="px-3 py-1">
                                    {currentPage + 1} / {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages - 1
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#8C4FF2] text-white hover:bg-[#7A43D6]'
                                        }`}
                                >
                                    다음
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages - 1
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#8C4FF2] text-white hover:bg-[#7A43D6]'
                                        }`}
                                >
                                    마지막
                                </button>
                            </div>
                        )}

                        {totalElements > 0 && (
                            <div className="text-center mt-4 text-sm text-gray-500">총 {totalElements}개의 게시글</div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
