import AuthRedirect from "@/components/AuthRedirect"
import Dashboard from "@/components/dashboard"

const page = () => {
    return (
        <div>
            <Dashboard />
             <AuthRedirect  requireAuth={true} />
        </div>
    )
}

export default page