import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { fetchWorkspaces } from '../features/workspaceSlice'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        // Verify token is still valid by fetching user
        const verifyAuth = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (!response.ok) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    navigate('/login')
                    return
                }

                const data = await response.json()
                if (data.success) {
                    localStorage.setItem('user', JSON.stringify(data.data))
                }
            } catch (error) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
            }
        }

        verifyAuth()
    }, [navigate])
    
    // Initial load of theme and workspaces
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
        dispatch(loadTheme())
            dispatch(fetchWorkspaces())
    }
    }, [dispatch])
    if (loading) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
