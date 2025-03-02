interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-6">
      {message}
    </div>
  );
} 