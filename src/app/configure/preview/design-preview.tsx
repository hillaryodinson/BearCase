"use client";
import Phone from "@/components/custom/phone";
import { Button } from "@/components/ui/button";
import { BASE_PRICE } from "@/config/products";
import { cn, formatPrice } from "@/lib/utils";
import {
	COLORS,
	FINISHES,
	MATERIALS,
	MODELS,
} from "@/validators/option-validator";
import { Configuration } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import { createCheckoutSession } from "./action";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import LoginModal from "@/components/custom/login-modal";

export default function DesignPreview({
	configuration,
}: {
	configuration: Configuration;
}) {
	const router = useRouter();
	const { toast } = useToast();
	const { color, croppedImageUrl, model, finish, material } = configuration;
	const { user } = useKindeBrowserClient();
	const [showConfetti, setShowConfetti] = useState<boolean>(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

	const tw = COLORS.find(
		(supportedColor) => supportedColor.value === color
	)?.tw;

	const { label: modelLabel } = MODELS.options.find(
		(search) => search.value === model
	)!;

	const { price: finishPrice } = FINISHES.options.find(
		(search) => search.value === finish
	)!;
	const { price: materialPrice } = MATERIALS.options.find(
		(search) => search.value === material
	)!;

	let totalPrice = BASE_PRICE;
	if (material === "polycarbonate") {
		totalPrice += materialPrice;
	}
	if (finish === "textured") {
		totalPrice += finishPrice;
	}

	const { mutate: createPaymentSession } = useMutation({
		mutationKey: ["get-checkout-session"],
		mutationFn: createCheckoutSession,
		onSuccess: ({ url }) => {
			if (url) {
				router.push(url);
			} else {
				throw new Error("Unable fetch payment url");
			}
		},
		onError: () => {
			toast({
				title: "Something went wrong",
				description: "There was an error on our end. Please try again",
				variant: "destructive",
			});
		},
	});

	useEffect(() => setShowConfetti(true), []);

	const handleCheckout = () => {
		if (user) {
			createPaymentSession({ configId: configuration.id });
		} else {
			//user was not logged in
			localStorage.setItem("configurationId", configuration.id);
			setIsLoginModalOpen(true);
		}
	};
	return (
		<>
			<div
				className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
				aria-hidden="true">
				<Confetti
					active={showConfetti}
					config={{ elementCount: 200, spread: 90 }}
				/>
			</div>
			<LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
			<div className="mt-20 grid grid-cols-1 text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
				<div className="sm:col-span-4 md:col-span-3 md:row-span-2 md:row-end-2">
					<Phone imgSrc={croppedImageUrl!} className={cn(`bg-${tw}`)} />
				</div>
				<div className="mt-6 sm:col-span-9 sm:mt-0 md:row-end-1">
					<h3 className="text-3xl font-bold trackong-tight text-gray-900">
						Your {modelLabel} Case
					</h3>
					<div className="mt-3 flex items-center gap-1.5 text-base">
						<Check className="h-4 w-4 text-green-600" />
						In stock and ready to ship
					</div>
				</div>

				<div className="sm:col-span-12 md:col-span-9 text-base">
					<div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 smLgap-x-6 sm:py-6 md:py-10">
						<div>
							<p className="font-medium text-zinc-950">Highlights</p>
							<ol className="mt-3 text-zinc-700 list-disc list-inside">
								<li>Wireless charging compatible</li>
								<li>TPU Shock absorption</li>
								<li>Packaging made from recycled materials</li>
								<li>2 years print warranty</li>
							</ol>
						</div>
						<div>
							<p className="font-medium text-zinc-950">Materials</p>
							<ol className="mt-3 text-zinc-700 list-disc list-inside">
								<li>High quality durable material</li>
								<li>Scratch and fingerprint resistant coating</li>
							</ol>
						</div>
					</div>
					<div className="mt-8">
						<div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
							<div className="flow-root text-sm">
								<div className="flex items-center justify-between py-1 mt-2">
									<p className="text-gray-600">Base Price</p>
									<p className="font-medium text-gray-900">
										{formatPrice(BASE_PRICE / 100)}
									</p>
								</div>
								{finish === "textured" ? (
									<div className="flex items-center justify-between py-1 mt-2">
										<p className="text-gray-600">Textured Finish</p>
										<p className="font-medium text-gray-900">
											{formatPrice(finishPrice / 100)}
										</p>
									</div>
								) : null}
								{material !== "silicone" ? (
									<div className="flex items-center justify-between py-1 mt-2">
										<p className="text-gray-600">Soft PolyCarbonate Material</p>
										<p className="font-medium text-gray-900">
											{formatPrice(materialPrice / 100)}
										</p>
									</div>
								) : null}
								<div className="my-2 h-px bg-gray-200" />
								<div className="flex items-center justify-between my-2">
									<p className="font-semibold text-gray-900">Total</p>
									<p className="font-semibold text-gray-900">
										{formatPrice(totalPrice / 100)}
									</p>
								</div>
							</div>
						</div>
						<div className="mt-8 flex justify-end pb-12">
							<Button
								className="px-4 sm:px-6 lg:px-8"
								onClick={() => handleCheckout()}>
								Check out <ArrowRight className="h-4 w-4 ml-1.5 inline" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
