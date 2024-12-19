"use client";

import { useState, useEffect } from "react";
import { type Product } from "@/types/product";
import productsData from "@/data/products.json";
import { useUser } from "@/contexts/UserContext";

function getCompanyFromEmail(email: string): string | null {
  const domain = email.split('@')[1];
  if (!domain) return null;

  // Map domains to company names
  const domainMap: Record<string, string> = {
    'sharkgaming.com': 'SharkGaming',
    'soffadirekt.se': 'SoffaDirekt',
    'markslojd.com': 'Markslojd',
    'kajakk-fritid.no': 'Kajakk-Fritid'
  };

  // Get company name from domain
  const company = domainMap[domain];
  if (!company) {
    console.warn(`No company mapping found for domain: ${domain}`);
  }

  return company || null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    // Get company name from email domain
    const companyName = getCompanyFromEmail(user.email);
    if (!companyName) {
      setIsLoading(false);
      return;
    }

    // Get products for the company
    const companyProducts = productsData.clients[companyName as keyof typeof productsData.clients] || [];
    setProducts(companyProducts);
    setIsLoading(false);
  }, [user]);

  return { products, isLoading };
}