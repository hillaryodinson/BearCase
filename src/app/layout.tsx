import type { Metadata } from "next";
import { Inter, Recursive } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/custom/navbar";
import Footer from "@/components/custom/footer";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/custom/providers";
import PageProgressProvider from "@/components/custom/page-progress";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Bear Case",
	description: "Customize your phone case",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={recursive.className}>
				<PageProgressProvider>
					<Navbar />
					<main className="grainy-light flex flex-col min-h-[calc(100vh-3.5rem-1px)]">
						<div className="flex flex-1 flex-col h-full">
							<Providers>{children}</Providers>
						</div>
						<Footer />
					</main>
				</PageProgressProvider>
				<Toaster />
			</body>
		</html>
	);
}
