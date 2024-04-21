import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import EditAccountDetails from '../Components/Patients/editAccountDetails'; 

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn().mockReturnValue({ name: '[DEFAULT]' }),
    getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        signOut: jest.fn(() => Promise.resolve()),
    })),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
    getDoc: jest.fn().mockImplementation((docRef) => {
        if (docRef.path === "users/12345") {
            return Promise.resolve({
                exists: () => true,
                data: () => ({
                    firstName: 'John',
                    lastName: 'Doe',
                    dob: '1990-01-01',
                    gender: 'male',
                    phoneNumber: '+1234567890',
                    email: 'john.doe@example.com',
                    address: '123 Elm Street',
                })
            });
        } else {
            return Promise.resolve({
                exists: () => false,
                data: () => ({})
            });
        }
    })
}));


jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(() => ({})),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(() => jest.fn()),
}));

global.alert = jest.fn();

const renderWithAuthContext = (ui, { user } = {}) => {
    return render(
        <AuthContext.Provider value={{ currentUser: user }}>
            <Router>{ui}</Router>
        </AuthContext.Provider>
    );
};

describe('EditAccountDetails Component', () => {
    
    it('handles scenario where no user data is present', async () => {
        require('firebase/firestore').getDoc.mockResolvedValueOnce({
            exists: jest.fn(() => false),
            data: jest.fn(() => ({}))
        });

        const user = { uid: '12345' };
        const { queryByText } = renderWithAuthContext(<EditAccountDetails />, { user });

        await waitFor(() => {
            expect(queryByText("No such document!")).not.toBeInTheDocument();
        });
    });

    it('displays errors for invalid data', async () => {
        const user = { uid: '12345' };
        const { getByLabelText, getByText, findAllByRole } = renderWithAuthContext(<EditAccountDetails />, { user });
    
        fireEvent.change(getByLabelText(/Phone Number/i), { target: { value: 'invalid number' } });
        fireEvent.submit(getByText('Edit Details'));
    
        await waitFor(() => {
            expect(findAllByRole('alert')).resolves.toHaveLength(1);
        });
    });
});
