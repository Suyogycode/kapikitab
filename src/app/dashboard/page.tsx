import { redirect } from 'next/navigation';

export default function DashboardIndex() {
  // Instantly bounces the user to the lesson view
  redirect('/dashboard/lesson');
}