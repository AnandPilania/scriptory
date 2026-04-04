import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

// Lets child pages push title + dirty state up to the header
export const LayoutContext = createContext({
    setHeaderMeta: () => {},
})

export function useLayoutMeta(meta) {
    const { setHeaderMeta } = useContext(LayoutContext)
    // Call in a useEffect from child pages
    return setHeaderMeta
}

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [headerMeta, setHeaderMeta] = useState({ title: '', icon: '', isDirty: false })

    return (
        <LayoutContext.Provider value={{ setHeaderMeta }}>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <Header
                        toggleSidebar={() => setSidebarOpen(o => !o)}
                        title={headerMeta.title}
                        icon={headerMeta.icon}
                        isDirty={headerMeta.isDirty}
                    />
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </LayoutContext.Provider>
    )
}
