import React from 'react'
import Modal, { ModalBody, ModalFooter } from './ui/Modal'
import Button from './ui/Button'

export default function ConfirmDialog({
  open,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} widthClass="max-w-sm">
      <ModalBody>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path
              d="M12 9v4M12 16.5h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.58 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mb-1.5 text-base font-semibold text-navy-950">{title}</h2>
        <p className="text-sm leading-relaxed text-navy-900/60">{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" variant={danger ? 'danger' : 'primary'} disabled={loading} onClick={onConfirm}>
          {loading ? 'Menghapus\u2026' : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
