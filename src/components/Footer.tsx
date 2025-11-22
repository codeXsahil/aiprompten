import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t py-12 mt-auto">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">


            <span className="text-xl font-bold text-foreground tracking-tight">
              Prompt<span className="text-primary">Gallery</span>
            </span>

            <p className="text-sm text-muted-foreground">
              Discover and share amazing AI-generated art prompts.
            </p>
          </div>



          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Credits</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span>Developer:</span>
                <a href="https://instagram.com/sahilgupta.pvtt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Sahil Gupta <Instagram className="h-4 w-4" />
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>Promoter:</span>
                <a href="https://instagram.com/bytanmay" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Tanmay Pandey <Instagram className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PromptGallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
