import Link from 'next/link';
import { FaGithub, FaTwitter, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">ავტო ფორუმის შესახებ</h3>
            <p className="text-gray-400 text-sm">
              ავტომობილების მოყვარულთათვის შექმნილი აქტიური საზოგადოება, სადაც შეგიძლიათ განიხილოთ, გაზიაროთ ცოდნა და დაუკავშირდეთ სხვა ავტოინდუსტრიის მოყვარულებს.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">სწრაფი ლინკები</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                  მთავარი
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-gray-400 hover:text-white text-sm">
                  კატეგორიები
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white text-sm">
                  ძებნა
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-bold mb-4">საზოგადოება</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/create-topic" className="text-gray-400 hover:text-white text-sm">
                  თემის შექმნა
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-gray-400 hover:text-white text-sm">
                  წესები
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white text-sm">
                  ხშირად დასმული კითხვები
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">ჩვენთან დაკავშირება</h3>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaGithub size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ავტო ფორუმი. ყველა უფლება დაცულია.
          </p>
        </div>
      </div>
    </footer>
  );
}
