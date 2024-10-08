import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatFooter from '../ChatFooter';

const mockProps = {
    isClosed: false,
    sendFile: jest.fn(),
    sendMessage: jest.fn(),
};

jest.mock('@deriv-com/ui', () => ({
    ...jest.requireActual('@deriv-com/ui'),
    useDevice: () => ({ isMobile: false }),
}));
describe('ChatFooter', () => {
    it('should render the component as expected', () => {
        render(<ChatFooter {...mockProps} />);
        expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument();
    });
    it('should render the conversation closed message', () => {
        render(<ChatFooter {...{ ...mockProps, isClosed: true }} />);
        expect(screen.getByText('This conversation is closed.')).toBeInTheDocument();
    });
    it('should expect value to be set on changing input', async () => {
        render(<ChatFooter {...mockProps} />);
        const input = screen.getByPlaceholderText('Enter message');
        await userEvent.type(input, 'Hello');
        expect(input).toHaveValue('Hello');
    });
    it('should handle click send message', async () => {
        render(<ChatFooter {...mockProps} />);
        const input = screen.getByPlaceholderText('Enter message');
        await userEvent.type(input, 'Hello');
        await userEvent.click(screen.getByRole('button'));
        expect(mockProps.sendMessage).toHaveBeenCalledWith('Hello');
    });
    it('should handle click send attachment', async () => {
        const file: File = new File(['bye'], 'bye.png', { type: 'image/png' });
        render(<ChatFooter {...mockProps} />);
        const input = screen.getByTestId('dt_file_input');
        await userEvent.upload(input, file);
        expect(mockProps.sendFile).toHaveBeenCalledWith(file);
    });
    it('should handle keyboard enter event without new line', async () => {
        render(<ChatFooter {...mockProps} />);
        const input = screen.getByPlaceholderText('Enter message');
        await userEvent.type(input, 'Hello');
        await userEvent.type(input, '{enter}');
        expect(mockProps.sendMessage).toHaveBeenCalledWith('Hello');
    });
});
