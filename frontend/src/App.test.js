import { render, screen } from '@testing-library/react';
import App from './App';

test('renders brainlink header', () => {
  render(<App />);
  const headerElement = screen.getByText(/brainlink/i);
  expect(headerElement).toBeInTheDocument();
});
