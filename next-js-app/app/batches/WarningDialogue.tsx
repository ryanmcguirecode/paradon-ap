import Warning from "@mui/icons-material/Warning";
import { Box, Button, Typography, ModalDialog, Modal } from "@mui/joy";

export default function UnlockWarning({
  showWarning: showWarning,
  setShowWarning,
  onUnlock,
}: {
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  onUnlock: () => void;
}) {
  return (
    <Modal open={showWarning} onClose={() => setShowWarning(false)}>
      <ModalDialog
        aria-labelledby="mappings-table-dialog"
        sx={{
          position: "relative",
          width: "600px",
          p: 3,
          borderRadius: "md",
          boxShadow: "lg",
        }}
      >
        <Typography id="mappings-table-dialog" level="h4" endDecorator>
          Are you sure you want to unlock this batch?
        </Typography>
        <Typography>
          Unlocking this batch will kick out the user who is currently working,
          and lead to possible data loss.
        </Typography>
        <Box
          sx={{
            maxHeight: "400px", // Set the maximum height of the table container
            overflowY: "auto", // Enable vertical scrolling
          }}
        ></Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color="primary"
            sx={{ mt: 2, mr: 2 }}
            onClick={() => setShowWarning(false)}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            sx={{ mt: 2 }}
            onClick={() => {
              setShowWarning(false);
              onUnlock();
            }}
          >
            Unlock
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
