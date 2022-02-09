import { useContext, useEffect } from "react";
import { Footer, Navbar, Services, Transactions, Welcome } from "./components";
import { TransactionContext } from "./context/TransactionContext";

export default function App() {
	const { checkIfWalletConnected } = useContext(TransactionContext);

	useEffect(() => { checkIfWalletConnected() }, [])

	return (
		<div className="min-h-screen">
			<div className="gradient-bg-welcome">
				<Navbar />
				<Welcome />
			</div>
			<Services />
			<Transactions />
			<Footer />
		</div>
	);
}
