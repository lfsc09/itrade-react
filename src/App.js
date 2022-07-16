import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './routes/routes';
import { AuthProvider } from './ctx/AuthContext';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <MainRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
