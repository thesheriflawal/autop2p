import RegistrationGate from "@/components/RegistrationGate";

const Register = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Register</h1>
        <p className="text-muted-foreground">Map your email to your connected wallet address.</p>
      </div>
      <RegistrationGate />
    </div>
  );
};

export default Register;