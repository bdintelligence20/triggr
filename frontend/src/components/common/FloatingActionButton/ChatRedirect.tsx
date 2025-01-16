import { useNavigate } from 'react-router-dom';

interface ChatRedirectProps {
  type: 'report' | 'request';
}

export const useChatRedirect = ({ type }: ChatRedirectProps) => {
  const navigate = useNavigate();

  const redirectToChat = () => {
    navigate('/chat', {
      state: {
        chatType: type,
        placeholder: type === 'report' 
          ? "Type your report details here..."
          : "Type your request here..."
      }
    });
  };

  return redirectToChat;
};