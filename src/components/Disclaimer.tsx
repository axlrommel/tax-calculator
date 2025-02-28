function Disclaimer() {
  return (<div className="mt-8 text-sm text-gray-600">
    <p className="mb-2">*This calculator provides estimates based on the inputs provided. It does not guarantee future results or account for all possible variables.</p>
    <p className="mb-2">**Consult a financial advisor for personalized advice.</p>
    <p>
          &copy; {new Date().getFullYear()} <a href="https://rommelvillagomez.com"
            target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline">Rommel Villagomez</a>.
          All Rights Reserved.
        </p>
  </div>)
}

export default Disclaimer;