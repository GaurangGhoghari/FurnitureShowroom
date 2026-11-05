
const Map = ({ products, renderItem, emptyMessage = "No products found." }) => {
  if (!products || products.length === 0) {
    return (
      <div className="mt-8 py-12 text-center text-stone-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div key={product.id ?? product._id ?? index}>
          {renderItem(product)}
        </div>
      ))}
    </div>
  );
};

export default Map;