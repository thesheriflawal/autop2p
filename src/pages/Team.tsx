import { Card } from "@/components/ui/card";
import { Users, Briefcase, Code, Palette, Zap } from "lucide-react";

const teamMembers = [
  {
    name: "Sherif",
    role: "Project Lead",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    name: "Fawaz",
    role: "Backend Developer",
    icon: Code,
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    name: "Lion",
    role: "Frontend Developer",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    name: "Joy",
    role: "UI/UX Designer",
    icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-100",
  },
  {
    name: "Pelumi",
    role: "Product Manager",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
];

const Team = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Details</h1>
        <p className="text-muted-foreground">
          Meet the team behind AutoP2P
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card
            key={member.name}
            className="p-6 hover:shadow-soft transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`h-20 w-20 rounded-full ${member.bg} flex items-center justify-center mb-4`}
              >
                <member.icon className={`h-10 w-10 ${member.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 mt-8">
        <h3 className="text-2xl font-bold mb-4">About AutoP2P</h3>
        <p className="text-muted-foreground mb-4">
          AutoP2P is built by a passionate team of developers and designers
          committed to making peer-to-peer cryptocurrency trading simple,
          secure, and accessible to everyone in Nigeria.
        </p>
        <p className="text-muted-foreground">
          Our platform combines automated payment processing with the flexibility
          of manual trading, giving you the best of both worlds. We're here to
          revolutionize how Nigerians trade digital assets.
        </p>
      </Card>
    </div>
  );
};

export default Team;
