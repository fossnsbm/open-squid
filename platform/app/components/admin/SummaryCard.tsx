function SummaryCard() {
    return (
        
            <div className=" bg-gray-800 rounded-lg p-6 shadow-xl border border-pink-900 w-full">

                <div className="flex flex-col text-2xl gap-4">
                    <div className="flex flex-row items-center justify-between w-full border border-pink-400 p-4 rounded-full shadow-lg shadow-gray-900">
                        <p className="ml-4">Registered Teams</p>{" "}
                        <span className="flex items-center justify-center border-pink-400 rounded-full p-2 w-14 h-14 border-2 font-bold shadow-lg shadow-gray-900">
                            13
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-between w-full border border-pink-400 p-4 rounded-full shadow-lg shadow-gray-900">
                        <p className="ml-4">Online Teams</p>{" "}
                        <span className="flex items-center justify-center border-pink-400 rounded-full p-2 w-14 h-14 border-2 font-bold  shadow-lg shadow-gray-900">
                            8
                        </span>
                    </div>
                </div>
            </div>
    );
}
export default SummaryCard;
