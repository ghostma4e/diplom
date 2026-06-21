import { createContext, useCallback, useContext, useState } from 'react';
import { useLocale } from './LocaleContext.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const { t } = useLocale();
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title ?? t('confirm.title'),
        message: options.message ?? '',
        confirmLabel: options.confirmLabel ?? t('confirm.yes'),
        cancelLabel: options.cancelLabel ?? t('confirm.no'),
        variant: options.variant ?? 'danger',
        resolve,
      });
    });
  }, [t]);

  function close(result) {
    if (dialog) {
      dialog.resolve(result);
      setDialog(null);
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div className="modal-overlay confirm-overlay" role="presentation">
          <div
            className={`confirm-dialog ${dialog.variant}`}
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <div className="confirm-icon" aria-hidden="true">
              {dialog.variant === 'danger' ? '⚠' : '?'}
            </div>
            <h3 id="confirm-title">{dialog.title}</h3>
            <p id="confirm-message">{dialog.message}</p>
            <div className="confirm-actions">
              <button type="button" className="btn-outline" onClick={() => close(false)}>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                className={dialog.variant === 'danger' ? 'btn-danger-confirm' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx;
}
