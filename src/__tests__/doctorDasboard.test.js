import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import DoctorDashboard from '../Components/doctor/doctorDashboard';
import { signOut ,getAuth} from 'firebase/auth';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
    })),
    signOut: jest.fn(() => Promise.resolve()),
  }));
  

const mockUser = {
  uid: 'doctor123',
};

const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <AuthContext.Provider value={{ currentUser: mockUser }}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('DoctorDashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockNavigate.mockReset();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<DoctorDashboard />);
    expect(getByText('Welcome to Doctor Dashboard')).toBeInTheDocument();
  });

  it('navigates to pending appointments on button click', () => {
    const { getByText } = renderWithProviders(<DoctorDashboard />);
    fireEvent.click(getByText('Pending Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/doctorPendingAppointmentsView');
  });

  it('navigates to ontime appointments on button click', () => {
    const { getByText } = renderWithProviders(<DoctorDashboard />);
    fireEvent.click(getByText('OnTime Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/doctorOntimeAppointments');
  });

  it('navigates to completed appointments on button click', () => {
    const { getByText } = renderWithProviders(<DoctorDashboard />);
    fireEvent.click(getByText('Completed Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/doctorCompletedAppointments');
  });

  it('calls sign out process on "Log Out" button click', async () => {
    const { getByText } = renderWithProviders(<DoctorDashboard />);
    fireEvent.click(getByText('Log Out'));
    await expect(signOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
