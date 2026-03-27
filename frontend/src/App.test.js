import { render, screen } from '@testing-library/react';
import App from './App';

test('renders kuppi session dashboard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/kuppi session dashboard/i);
  expect(titleElement).toBeInTheDocument();
});
