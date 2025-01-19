import Navbar from '../Manager/Navbar';

const Loading = () => {
    return (
        <>
            <Navbar userName="Hospital Manager" />
            <div className="lg:ml-64 p-4">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <div className="text-xl text-gray-600">Loading...</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Loading; 