import Catalog from "../components/Catalog";

export default function CatalogPage({ favoritesOnly = false }) {
  return <main><Catalog favoritesOnly={favoritesOnly} /></main>;
}
