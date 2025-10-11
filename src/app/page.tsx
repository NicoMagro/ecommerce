import { redirect } from 'next/navigation';

/**
 * Home Page
 * Redirects to the products listing page
 */
export default function Home() {
  redirect('/products');
}
