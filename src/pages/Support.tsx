import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";

const Support = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trade Support</h1>
        <p className="text-muted-foreground">
          Get help with your trades and account
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <Card className="p-6">
          <div className="mb-4">
            <MessageCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Telegram Support</h3>
            <p className="text-muted-foreground">
              Connect with our support team directly on Telegram for quick
              assistance with your trades.
            </p>
          </div>
          <Button asChild className="w-full">
            <a
              href="https://t.me/thesheriflawal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Telegram
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Common Issues</h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Payment Not Received?</p>
              <p className="text-sm text-muted-foreground">
                Contact support with your transaction ID
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Disputed Transaction?</p>
              <p className="text-sm text-muted-foreground">
                Open a dispute ticket via Telegram
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Account Issues?</p>
              <p className="text-sm text-muted-foreground">
                Reach out to us with your account details
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Support Hours</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">Monday - Friday</p>
              <p className="text-muted-foreground">9:00 AM - 10:00 PM WAT</p>
            </div>
            <div>
              <p className="font-medium mb-2">Saturday - Sunday</p>
              <p className="text-muted-foreground">10:00 AM - 8:00 PM WAT</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> For urgent issues during off-hours, please
              leave a message and we'll respond as soon as possible.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;
