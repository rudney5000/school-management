import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-blue-900">🎓 SchoolManager CD</h1>
                <p className="mt-2 text-gray-600">Gestion scolaire pour le Congo</p>
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-green-600">✅ Frontend connecté !</p>
                </div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);