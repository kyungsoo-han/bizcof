import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionExpiredModalProps {
  open: boolean;
}

const SessionExpiredModal = ({ open }: SessionExpiredModalProps) => {
  const handleConfirm = () => {
    // 토큰 정리 후 로그인 페이지로 이동
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user_info');
    localStorage.removeItem('lastActivity');
    window.location.href = '/login';
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>세션 만료</DialogTitle>
          <DialogDescription>
            30분 동안 활동이 없어 세션이 만료되었습니다.
            <br />
            다시 로그인해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredModal;
