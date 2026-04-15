'use client'

import * as Dialog from '@radix-ui/react-dialog'

interface DeleteCaseDialogProps {
  open: boolean
  caseName: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function DeleteCaseDialog({ open, caseName, onConfirm, onCancel, loading }: DeleteCaseDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-app-card border border-app rounded-2xl p-6 shadow-2xl w-[calc(100vw-2rem)] max-w-sm">
          <Dialog.Title className="text-lg font-bold text-app-primary mb-2">מחיקת תיק</Dialog.Title>
          <Dialog.Description className="text-sm text-app-secondary mb-6">
            האם למחוק את התיק <strong className="text-app-primary">&quot;{caseName}&quot;</strong>?
            המשימות המקושרות יישארו אך יאבדו את הקישור לתיק זה.
          </Dialog.Description>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 text-sm bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'מוחק...' : 'מחק תיק'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm border border-app rounded-xl font-medium text-app-secondary hover:bg-app-secondary transition-colors"
            >
              ביטול
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
