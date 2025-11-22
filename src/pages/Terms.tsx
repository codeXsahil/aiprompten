import React from "react";
import { Navbar } from "@/components/Navbar";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar showSearch={false} showAdminControls={false} />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing or using Prompt Vision Gallery, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                        <p className="text-muted-foreground">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Prompt Vision Gallery's website for personal,
                            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on Prompt Vision Gallery's website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. User Content</h2>
                        <p className="text-muted-foreground">
                            You retain all rights in, and are solely responsible for, the User Content you post to Prompt Vision Gallery.
                            By posting User Content, you grant Prompt Vision Gallery a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use,
                            copy, modify, create derivative works based upon, distribute, publicly display, and publicly perform your User Content in connection with operating and providing the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Disclaimer</h2>
                        <p className="text-muted-foreground">
                            The materials on Prompt Vision Gallery's website are provided on an 'as is' basis. Prompt Vision Gallery makes no warranties, expressed or implied,
                            and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability,
                            fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Limitations</h2>
                        <p className="text-muted-foreground">
                            In no event shall Prompt Vision Gallery or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
                            or due to business interruption) arising out of the use or inability to use the materials on Prompt Vision Gallery's website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
