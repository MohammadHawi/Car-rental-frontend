import { Component } from '@angular/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: NavSubItem[];
  expanded?: boolean;
}

interface NavSubItem {
  label: string;
  icon?: string;
  
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Cars', icon: 'directions_car', route: '/cars' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Contracts', icon: 'description', route: '/contracts' },
    { 
      label: 'Finance', 
      icon: 'account_balance', 
      route: '/finance',
      children: [
        { label: 'Dashboard', route: '/finance' },
        { label: 'Transactions', route: '/finance/list' }
      ],
      expanded: false
    },
    { label: 'Booking Calendar', icon: 'calendar_today', route: '/booking-calendar' },
    { 
      label: 'Tasks', 
      icon: 'check_circle', 
      route: '/tasks',
      children: [
        { label: 'Active Tasks', route: '/tasks/active' },
        { label: 'Completed Tasks', route: '/tasks/completed' }
      ],
      expanded: false
    },
    {
  label: 'Statistics',
  icon: 'insights',
  route: '/statistics',
  children: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/statistics'
    },
    {
      label: 'Car Performance',
      icon: 'directions_car',
      route: '/statistics/cars'
    },
    {
      label: 'Customer Analytics',
      icon: 'people',
      route: '/statistics/customers'
    }
  ]
}
  ];
  
  isMobileMenuOpen = false;
  
  toggleSubMenu(item: NavItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}