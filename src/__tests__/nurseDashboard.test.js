import React from 'react';
import { render, fireEvent ,waitFor} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import NurseDashboard from '../Components/nurse/nurseDashboard';
import { signOut } from 'firebase/auth';

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
  uid: 'nurse123',
};

const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <AuthContext.Provider value={{ currentUser: mockUser }}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('NurseDashboard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<NurseDashboard />);
    expect(getByText('Welcome to Nurse Dashboard')).toBeInTheDocument();
  });

  it('navigates to pending appointments on button click', () => {
    const { getByText } = renderWithProviders(<NurseDashboard />);
    fireEvent.click(getByText('Pending Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/nurseAppointmentsView');
  });

  it('navigates to accepted appointments on button click', () => {
    const { getByText } = renderWithProviders(<NurseDashboard />);
    fireEvent.click(getByText('Accepted Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/nurseAcceptedAppointmentsView');
  });

  it('navigates to equipment appointments on button click', () => {
    const { getByText } = renderWithProviders(<NurseDashboard />);
    fireEvent.click(getByText('Edit Equipment Appointments'));
    expect(mockNavigate).toHaveBeenCalledWith('/nurseEditEquipmentBookings');
  });

  it('calls sign out process on "Log Out" button click', async () => {
    const { getByText } = renderWithProviders(<NurseDashboard />);
    fireEvent.click(getByText('Log Out'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
