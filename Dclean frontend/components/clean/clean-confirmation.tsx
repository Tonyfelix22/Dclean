'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface CleanConfirmationProps {
  filesCount: number;
  totalSize: number;
  riskLevels: { high: number; medium: number; low: number };
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CleanConfirmation({
  filesCount,
  totalSize,
  riskLevels,
  onConfirm,
  onCancel,
  loading = false,
}: CleanConfirmationProps) {
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);

  const handleProceed = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'delete files' && understood) {
      onConfirm();
    }
  };

  const canConfirm =
    confirmText.toLowerCase() === 'delete files' && understood && !loading;

  return (
    <div className="space-y-4">
      {step === 'warning' ? (
        <Card className="border-destructive/50 bg-destructive/5 p-6">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Review Before Cleaning
              </h2>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-foreground">
                  You&apos;re about to permanently delete:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Files</p>
                    <p className="text-xl font-bold text-foreground">
                      {filesCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Size</p>
                    <p className="text-xl font-bold text-foreground">
                      {(totalSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                    <p className="text-xl font-bold text-foreground">
                      {riskLevels.high > 0
                        ? 'HIGH'
                        : riskLevels.medium > 0
                          ? 'MEDIUM'
                          : 'LOW'}
                    </p>
                  </div>
                </div>

                {riskLevels.high > 0 && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-destructive mb-2">
                      ⚠️ High-Risk Files Included
                    </p>
                    <p className="text-sm text-destructive/80">
                      {riskLevels.high} high-risk file(s) will be deleted. These may be
                      important for your system operation. Review carefully.
                    </p>
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-600 mb-2">
                    💡 This Action Cannot Be Undone
                  </p>
                  <p className="text-sm text-yellow-600/80">
                    Once deleted, files will be permanently removed. Consider backing up
                    important data first.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleProceed}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading && <Spinner className="h-4 w-4" />}
                  I Understand, Proceed
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-primary/50 bg-primary/5 p-6">
          <div className="flex gap-4">
            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Final Confirmation
              </h2>

              <p className="text-sm text-foreground mb-6">
                Type <span className="font-mono font-bold">delete files</span> below to
                confirm deletion:
              </p>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'delete files' to confirm"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="understood"
                    checked={understood}
                    onCheckedChange={(checked) =>
                      setUnderstood(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="understood"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    I understand this action is permanent and cannot be undone
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setStep('warning')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="gap-2"
                >
                  {loading && <Spinner className="h-4 w-4" />}
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
