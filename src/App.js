import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './routes/routes';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { setUserFromLocalToken } from './store/auth/auth-slice';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = jwtDecode(token);
            dispatch(setUserFromLocalToken({ token: token, user: user }));
        }
    }, [dispatch]);

    return (
        <BrowserRouter>
            <MainRoutes />
        </BrowserRouter>
    );
}

export default App;
