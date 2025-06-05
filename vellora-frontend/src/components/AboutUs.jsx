import React from "react";

const Aboutus = () => {
  return (
    <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg my-8 max-w-4xl font-body">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center font-headings">
        About Us
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-headings">
          Our Story
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Welcome to Vellora, where passion for fashion meets the art of makeup.
          Founded in 2025, Vellora was born out of a desire to create a curated
          space for individuals to express their unique style and enhance their
          natural beauty. We believe that fashion and makeup are powerful tools
          for self-expression, confidence, and creativity.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Our journey began with a small team of enthusiasts who shared a common
          vision: to bring high-quality, trendy, and ethically sourced fashion
          and beauty products directly to you. From the latest runway-inspired
          collections to timeless makeup essentials, every item at Vellora is
          handpicked with care and attention to detail.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-headings">
          Our Mission
        </h2>
        <p className="text-gray-700 leading-relaxed">
          At Vellora, our mission is to empower you to look and feel your best,
          every single day. We are dedicated to:
        </p>
        <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 leading-relaxed">
          <li>
            <span className="font-medium">Providing Quality:</span> Offering
            only the finest fashion apparel and makeup products that meet our
            rigorous standards for quality and durability.
          </li>
          <li>
            <span className="font-medium">Inspiring Confidence:</span> Helping
            you discover products that boost your self-assurance and allow your
            true personality to shine through.
          </li>
          <li>
            <span className="font-medium">Promoting Inclusivity:</span> Curating
            a diverse range of styles and shades to cater to all skin tones,
            body types, and fashion preferences.
          </li>
          <li>
            <span className="font-medium">Ensuring Sustainability:</span>{" "}
            Partnering with brands that prioritize ethical production practices
            and environmental responsibility.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-headings">
          Our Products
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Explore our extensive collections, featuring:
        </p>
        <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 leading-relaxed">
          <li>
            <span className="font-medium">Fashion:</span> From elegant dresses
            and chic outerwear to comfortable loungewear and accessories, we
            have everything you need to build a versatile wardrobe.
          </li>
          <li>
            <span className="font-medium">Makeup:</span> Discover a wide array
            of cosmetics, including foundations, lipsticks, eyeshadows, and
            skincare essentials from renowned brands.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-headings">
          Join Our Community
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We invite you to become a part of the Vellora family. Follow us on
          social media for daily inspiration, beauty tips, and exclusive offers.
          Sign up for our newsletter to stay updated on new arrivals and
          promotions.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Thank you for choosing Vellora. We are excited to be a part of your
          style journey!
        </p>
      </section>
    </div>
  );
};

export default Aboutus;
